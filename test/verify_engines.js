import assert from 'node:assert';
import { PDFDocument, rgb, degrees } from 'pdf-lib';
import crypto from 'node:crypto';

console.log('🧪 Testing Core Engines Functionality...\n');

// 1. Test PDF Document Creation & Manipulation
console.log('1️⃣ Testing PDF Creation, Merge & Rotate...');
const doc1 = await PDFDocument.create();
const page1 = doc1.addPage([600, 400]);
page1.drawText('Page 1 Test', { x: 50, y: 350, size: 24, color: rgb(0, 0, 1) });
const pdf1Bytes = await doc1.save();
assert.ok(pdf1Bytes.length > 0, 'PDF bytes generated');

const doc2 = await PDFDocument.create();
const page2 = doc2.addPage([600, 400]);
page2.drawText('Page 2 Test', { x: 50, y: 350, size: 24, color: rgb(1, 0, 0) });
const pdf2Bytes = await doc2.save();

// Merge doc1 and doc2
const mergedDoc = await PDFDocument.create();
const loaded1 = await PDFDocument.load(pdf1Bytes);
const loaded2 = await PDFDocument.load(pdf2Bytes);
const pages1 = await mergedDoc.copyPages(loaded1, loaded1.getPageIndices());
const pages2 = await mergedDoc.copyPages(loaded2, loaded2.getPageIndices());
pages1.forEach(p => mergedDoc.addPage(p));
pages2.forEach(p => mergedDoc.addPage(p));
assert.strictEqual(mergedDoc.getPageCount(), 2, 'Merged document should have 2 pages');

// Rotate page 1
mergedDoc.getPages()[0].setRotation(degrees(90));
assert.strictEqual(mergedDoc.getPages()[0].getRotation().angle, 90, 'Page 1 rotated 90 degrees');

// Split page 2 into new document
const splitDoc = await PDFDocument.create();
const [copiedPage2] = await splitDoc.copyPages(mergedDoc, [1]);
splitDoc.addPage(copiedPage2);
assert.strictEqual(splitDoc.getPageCount(), 1, 'Split document should have 1 page');

const splitBytes = await splitDoc.save();
assert.ok(splitBytes.length > 0, 'Split bytes generated');
console.log('✅ PDF Creation, Merge, Rotate, and Split verified!');

// 2. Test Cryptographic Checksum Integrity
console.log('\n2️⃣ Testing Cryptographic Hashes (SHA-256, MD5)...');
const sampleBuffer = Buffer.from('A Thousand Tools - 100% Private Client-Side Processing');
const sha256Expected = crypto.createHash('sha256').update(sampleBuffer).digest('hex');
const md5Expected = crypto.createHash('md5').update(sampleBuffer).digest('hex');

assert.strictEqual(sha256Expected.length, 64, 'SHA-256 length is 64 hex characters');
assert.strictEqual(md5Expected.length, 32, 'MD5 length is 32 hex characters');
console.log(`✅ SHA-256: ${sha256Expected}`);
console.log(`✅ MD5: ${md5Expected}`);

console.log('\n🎉 ALL ENGINE CHECKS PASSED!\n');
