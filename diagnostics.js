// Example using Next.js API Route
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const authHeader = req.headers.authorization;

    // Security Check
    if (authHeader !== `Bearer ${process.env.qwertyuiopasdfghjklzxcvbnm12345678901PDx4Vtw4YF6XfduRwwS6nKZ6sPAC9nCeR}`) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const systemData = req.body;
    
    // In a real app, you would save systemData to a database here
    console.log("Received data:", systemData);

    return res.status(200).json({ message: 'Data received' });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
