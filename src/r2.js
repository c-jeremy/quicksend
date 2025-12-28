import { AwsClient } from 'aws4fetch';

export class R2Client {
  constructor(env) {
    this.env = env;
    this.client = new AwsClient({
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      service: 's3',
      region: 'auto',
    });
    this.bucketName = env.R2_BUCKET_NAME;
    this.endpoint = env.R2_ENDPOINT;
  }

  async generateUploadUrl(key, fileType) {
    const url = new URL(`${this.endpoint}/${this.bucketName}/${key}`);
    const signed = await this.client.sign(url.toString(), {
      method: 'PUT',
      headers: {
        'Content-Type': fileType,
      },
      aws: { signQuery: true }
    });

    return signed.url;
  }

  getDownloadUrl(key) {
    const url = new URL(`${this.endpoint}/${this.bucketName}/${key}`);
    return this.client.sign(url.toString(), {
      method: 'GET',
      aws: { signQuery: true }
    }).then(r => r.url);
  }

  async setupCors() {
    // R2 requires XML for CORS configuration
    const url = new URL(`${this.endpoint}/${this.bucketName}?cors`);

    const corsXml = `
      <CORSConfiguration>
        <CORSRule>
          <AllowedOrigin>*</AllowedOrigin>
          <AllowedMethod>PUT</AllowedMethod>
          <AllowedMethod>GET</AllowedMethod>
          <AllowedMethod>HEAD</AllowedMethod>
          <AllowedMethod>POST</AllowedMethod>
          <AllowedHeader>*</AllowedHeader>
          <MaxAgeSeconds>3000</MaxAgeSeconds>
          <ExposeHeader>ETag</ExposeHeader>
        </CORSRule>
      </CORSConfiguration>
    `.trim();

    return this.client.fetch(url.toString(), {
      method: 'PUT',
      body: corsXml,
      headers: {
        'Content-Type': 'application/xml'
      }
    });
  }
}
