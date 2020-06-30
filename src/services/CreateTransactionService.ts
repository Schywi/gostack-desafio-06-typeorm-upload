import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    // TODO Cria a transação apartir do repositorio é salva ela

    // validar se a tag existe e se não existir criar ela
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    // validação de balance
    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('You do not have enough balance');
    }

    // buscando categoria
    let transactionCategory = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    // valida se a categoria existe , caso não , cria ela
    if (!transactionCategory) {
      transactionCategory = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(transactionCategory);
    }

    // Cria uma nova transação
    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: transactionCategory,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
