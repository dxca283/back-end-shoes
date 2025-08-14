const shoes = [];

export function getAllShoes() {
  return shoes.slice();
}

export function getShoeById(id) {
  return shoes.find(s => s.id === id) || null;
}

export function createShoeRecord(shoe) {
  shoes.push(shoe);
  return shoe;
}

export function updateShoeById(id, updated) {
  const index = shoes.findIndex(s => s.id === id);
  if (index === -1) {
    return null;
  }
  shoes[index] = updated;
  return updated;
}

export function deleteShoeById(id) {
  const index = shoes.findIndex(s => s.id === id);
  if (index === -1) {
    return false;
  }
  shoes.splice(index, 1);
  return true;
}