import { getCustomRepository, getRepository, In } from 'typeorm';
import csvParse from 'csv-parse';
import fs from 'fs';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository';

// interface CSV
interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);
    // TODO
    // stream que vai ler os nossos arquivos
    const contactsReadStream = fs.createReadStream(filePath);

    const parsers = csvParse({
      from_line: 2,
    });
    // lê as linhas conforme elas ficam disponiveis
    const parseCSV = contactsReadStream.pipe(parsers);

    // Bookinsert
    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );
      // verificar se cada variavel esta chegando corretamente
      if (!title || !type || !value) return;

      // BookInsert
      categories.push(category);

      transactions.push({ title, type, value, category });
    });

    // informa o que fazer quando o evento end for emitido
    await new Promise(resolve => parseCSV.on('end', resolve));

    // Mapear categorias no banco de dados
    const existentCategories = await categoriesRepository.find({
      where: {
        // verifica se alguma das categorieas esta no banco de dados
        title: In(categories),
      },
    });

    // filtrar os dados somente pelo titulo
    const existentCategoriesTitles = existentCategories.map(
      (category: Category) => category.title,
    );

    // Filtrar categorias que não existem
    const addCategoryTitles = categories
      .filter(category => !existentCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    // Colocar categorias filtradas no banco de dados
    const newCategories = categoriesRepository.create(
      addCategoryTitles.map(title => ({
        title,
      })),
    );

    // salvar a categoria filtrada no banco de dados
    await categoriesRepository.save(newCategories);

    // unir todas sa categorias
    const finalCategories = [...newCategories, ...existentCategories];

    // Criar a transação com as novas categorias
    const createdTransactions = transactionRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );
    // salva o arquivo
    await transactionRepository.save(createdTransactions);

    // exclui o arquivo depois ...
    await fs.promises.unlink(filePath);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
