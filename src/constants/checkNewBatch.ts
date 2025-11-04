type BatchInfo = {
  id: string; // "2025-11-02-01"
  messageCount: number; // số tin hiện có trong batch
};

export const getCurrentDateString = (): string => {
  const now = new Date();
  return now.toISOString().slice(0, 10); // "2025-11-03"
};

export const shouldCreateNewBatch = (currentBatch: BatchInfo): Boolean => {
  const today = getCurrentDateString();
  const batchDate = currentBatch.id.slice(0, 10); // "2025-11-02"

  const isNewDay = batchDate !== today;
  const isFull = currentBatch.messageCount >= 500;
  
  return isNewDay || isFull;
};

export const createNewBatch = (lastBatch: BatchInfo | null): BatchInfo => {
  const today = getCurrentDateString();

  if (!lastBatch) {
    return { id: `${today}-01`, messageCount: 0 };
  }

  const [batchDate, batchIndexStr] = [
    lastBatch.id.slice(0, 10),
    lastBatch.id.slice(-2),
  ];
  const isNewDay = batchDate !== today;

  const newIndex = isNewDay ? 1 : Number(batchIndexStr) + 1;
  const newBatchId = `${today}-${String(newIndex).padStart(2, '0')}`;

  return { id: newBatchId, messageCount: 0 };
};
