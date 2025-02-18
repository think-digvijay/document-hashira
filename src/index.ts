import { createHash } from 'crypto';
import { createReadStream } from 'fs';

type DocumentHashRecord = {
  orgId: string;
  fileName: string;
  hash: string;
};

let documentHashes: DocumentHashRecord[] = [];

function hashFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(filePath);

    stream.on('data', (data) => {
      hash.update(data);
    });

    stream.on('end', () => {
      resolve(hash.digest('hex'));
    });

    stream.on('error', (err) => {
      reject(err);
    });
  });
}

const createMerkleRoot = (hashes: string[]): string => {
  if (hashes.length === 1) {
    return hashes[0];
  }

  const newLevel: string[] = [];

  for (let i = 0; i < hashes.length; i += 2) {
    const left = hashes[i];
    const right = hashes[i + 1] || left; 
    const combinedHash = createHash('sha256').update(left + right).digest('hex');
    newLevel.push(combinedHash);
  }

  return createMerkleRoot(newLevel);
};

// const filePath = 'files/bigFile.txt';
// console.log(filePath);

// hashFile(filePath)
//   .then((hash) => {
//     console.log(`SHA-256 hash of the file is: ${hash}`);
//   })
//   .catch((err) => {
//     console.error('Error hashing file:', err);
//   });


const main = async () => {
  const filePaths = ['files/bigFile1.txt', 'files/example.txt', 'files/bigFile1.txt']; 

  const documentHashesPromises = filePaths.map(filePath => hashFile(filePath));
  const documentHashes = await Promise.all(documentHashesPromises);

  console.log('Document Hashes:', documentHashes);

  const merkleRoot = createMerkleRoot(documentHashes);
  console.log('Merkle Root:', merkleRoot);
};

main().catch(error => console.error('Error:', error));
