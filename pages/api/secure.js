import { Buffer } from 'buffer';

export default async (req, res) => {
  const projectId = process.env.IPFS_PROJECT_ID;
  const projectSecret = process.env.API_KEY_SECRET;
  const auth = `Basic ${Buffer.from(`${projectId}:${projectSecret}`).toString('base64')}`;

  res.status(200).json({ data: auth });
};
