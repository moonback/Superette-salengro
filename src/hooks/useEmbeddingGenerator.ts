
import { useState, useCallback, useRef, useEffect } from 'react';
import { InventoryItem } from '../types';
import { generateProductEmbedding } from '../lib/embeddingService';
import { syncInventoryItem } from '../lib/inventorySync';

export type EmbeddingState = {
  isRunning: boolean;
  isPaused: boolean;
  progress: {
    current: number;
    total: number;
    percentage: number;
  };
  currentProductName?: string;
  errors: Array<{ productName: string; error: string }>;
};

export const useEmbeddingGenerator = (inventory: InventoryItem[]) => {
  const [state, setState] = useState<EmbeddingState>({
    isRunning: false,
    isPaused: false,
    progress: { current: 0, total: 0, percentage: 0 },
    errors: [],
  });

  const queueRef = useRef<InventoryItem[]>([]);
  const shouldContinueRef = useRef(true);
  const isPausedRef = useRef(false);

  // Filter products that don't have embeddings
  const getProductsWithoutEmbeddings = useCallback(() => {
    return inventory.filter(item => !item.embedding || item.embedding.length === 0);
  }, [inventory]);

  // Start the embedding generation
  const start = useCallback(() => {
    const productsToProcess = getProductsWithoutEmbeddings();
    
    if (productsToProcess.length === 0) {
      return;
    }

    queueRef.current = [...productsToProcess];
    shouldContinueRef.current = true;
    isPausedRef.current = false;

    setState({
      isRunning: true,
      isPaused: false,
      progress: {
        current: 0,
        total: productsToProcess.length,
        percentage: 0,
      },
      errors: [],
    });

    // Start processing in background
    processQueue();
  }, [getProductsWithoutEmbeddings]);

  // Pause the process
  const pause = useCallback(() => {
    isPausedRef.current = true;
    setState(prev => ({ ...prev, isPaused: true }));
  }, []);

  // Resume the process
  const resume = useCallback(() => {
    if (queueRef.current.length > 0) {
      isPausedRef.current = false;
      setState(prev => ({ ...prev, isPaused: false }));
      processQueue();
    }
  }, []);

  // Stop the process entirely
  const stop = useCallback(() => {
    shouldContinueRef.current = false;
    isPausedRef.current = false;
    queueRef.current = [];
    setState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
    }));
  }, []);

  // Process the queue in background
  const processQueue = async () => {
    while (
      shouldContinueRef.current &&
      queueRef.current.length > 0 &&
      !isPausedRef.current
    ) {
      const product = queueRef.current.shift()!;
      
      setState(prev => ({
        ...prev,
        currentProductName: product.name,
        progress: {
          ...prev.progress,
          current: prev.progress.total - queueRef.current.length - 1,
          percentage: Math.round(
            ((prev.progress.total - queueRef.current.length - 1) / prev.progress.total) * 100
          ),
        },
      }));

      try {
        const embedding = await generateProductEmbedding(product);
        const updatedProduct = { ...product, embedding, lastUpdated: Date.now() };
        await syncInventoryItem(updatedProduct);
      } catch (error) {
        setState(prev => ({
          ...prev,
          errors: [
            ...prev.errors,
            { productName: product.name, error: String(error) },
          ],
        }));
      }

      // Small delay to not block UI
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // If queue is empty, mark as finished
    if (queueRef.current.length === 0 && shouldContinueRef.current) {
      setState(prev => ({
        ...prev,
        isRunning: false,
        isPaused: false,
        currentProductName: undefined,
        progress: {
          ...prev.progress,
          percentage: 100,
          current: prev.progress.total,
        },
      }));
    }
  };

  return {
    ...state,
    start,
    pause,
    resume,
    stop,
    canStart: getProductsWithoutEmbeddings().length > 0,
  };
};
