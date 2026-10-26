/**
 * Automated Test Suite for A Thousand Tools
 */

import assert from 'node:assert';
import { TOOLS, CATEGORIES, getToolById, searchTools, getToolsByCategory } from '../public/js/catalog.js';

console.log('🧪 Starting A Thousand Tools Test Suite...\n');

// 1. Catalog Tests
console.log('1️⃣ Testing Tools Catalog Integrity...');
assert.ok(CATEGORIES.length >= 6, 'Should have at least 6 categories');
assert.ok(TOOLS.length >= 30, `Should have extensive tool catalog, found: ${TOOLS.length}`);

TOOLS.forEach(tool => {
  assert.ok(tool.id, `Tool must have an id: ${JSON.stringify(tool)}`);
  assert.ok(tool.name, `Tool ${tool.id} must have a name`);
  assert.ok(tool.category, `Tool ${tool.id} must have a category`);
  assert.ok(tool.description, `Tool ${tool.id} must have a description`);
  assert.ok(tool.icon, `Tool ${tool.id} must have an icon`);
});
console.log(`✅ All ${TOOLS.length} tools passed integrity checks!`);

// 2. Query & Filter Tests
console.log('\n2️⃣ Testing Tool Search & Categorization...');
const mergeTool = getToolById('merge');
assert.ok(mergeTool, 'Should find merge tool by id');
assert.strictEqual(mergeTool.name, 'Merge PDF');

const compressTools = searchTools('compress');
assert.ok(compressTools.length >= 2, 'Search for "compress" should return PDF & Image compressors');

const imageTools = getToolsByCategory('image');
assert.ok(imageTools.length >= 8, 'Should have multiple image tools');
console.log(`✅ Search and category filtering passed!`);

// 3. Password Generator Logic Test
console.log('\n3️⃣ Testing Password Generator...');
import { generateSecurePassword } from '../public/js/crypto-utils.js';

const pwd16 = generateSecurePassword({ length: 16, includeUpper: true, includeLower: true, includeNumbers: true, includeSymbols: true });
assert.strictEqual(pwd16.password.length, 16, 'Password should be 16 characters long');
assert.ok(pwd16.entropy, 'Password should have entropy calculation');
assert.ok(['Strong', 'Very Strong', 'Military-Grade'].includes(pwd16.strength), 'Strength should be calculated');

const pwd32 = generateSecurePassword({ length: 32 });
assert.strictEqual(pwd32.password.length, 32, 'Password should be 32 characters long');
assert.strictEqual(pwd32.strength, 'Military-Grade', '32 char password should be military-grade');
console.log(`✅ Password generation and entropy calculations verified!`);

console.log('\n🎉 ALL TESTS PASSED! Application is rock-solid.\n');
