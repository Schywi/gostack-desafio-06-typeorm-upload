import { getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

// import Transaction from '../models/Transaction';

import Transactionsrepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    // TODO logica para deletar

    const transactionsRepository = getCustomRepository(Transactionsrepository);
    // busca pelo id
    const transaction = await transactionsRepository.findOne(id);
    // Valida se a transação existe
    if (!transaction) {
      throw new AppError('Transaction does not exist');
    }
    // remove a transação
    await transactionsRepository.remove(transaction);
    // o return fica implicito
  }
}

export default DeleteTransactionService;
