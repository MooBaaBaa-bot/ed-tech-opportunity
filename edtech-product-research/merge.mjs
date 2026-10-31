import assert from 'node:assert/strict';
// Same IDs are idempotent. Corrections must append a new record with a new ID
// and a revision note pointing to the prior record; history is never overwritten.
export function appendRecords(existing,incoming){const result=structuredClone(existing);for(const row of incoming){const old=result.find(x=>x.id===row.id);if(old)assert.deepEqual(row,old,`历史冲突：${row.id}；须追加修订，不得静默覆盖`);else result.push(structuredClone(row));}return result;}
