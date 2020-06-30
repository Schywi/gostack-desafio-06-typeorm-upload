import { Router } from 'express';
import multer from 'multer';

import { getCustomRepository } from 'typeorm';
import CreateTransactionService from '../services/CreateTransactionService';

import TransactionsRepository from '../repositories/TransactionsRepository';

import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

import uploadConfig from '../config/upload';

// middlware upload
const upload = multer(uploadConfig);

const transactionsRouter = Router();

// retorna todas as transações
transactionsRouter.get('/', async (request, response) => {
  // TODO

  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const transactions = await transactionsRepository.find();
  const balance = await transactionsRepository.getBalance();

  return response.json({ transactions, balance });
});

// cria uma transação
transactionsRouter.post('/', async (request, response) => {
  // TODO , Cria as transações
  const { title, value, type, category } = request.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(transaction);
});

// exclui uma transação apartir do id dado
transactionsRouter.delete('/:id', async (request, response) => {
  // TODO
  const { id } = request.params;

  const deleteTransaction = new DeleteTransactionService();

  await deleteTransaction.execute(id);

  return response.status(204).send();
});

// cria varias transações baseadas nos arquivos csv
transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    // TODO
    const importTransactions = new ImportTransactionsService();

    const transactions = await importTransactions.execute(request.file.path);

    return response.json(transactions);
  },
);

export default transactionsRouter;
