import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import income from '../../assets/income.svg';
import outcome from '../../assets/outcome.svg';
import total from '../../assets/total.svg';

import api from '../../services/api';

import Header from '../../components/Header';

import formatValue from '../../utils/formatValue';

import { Container, CardContainer, Card, TableContainer } from './styles';

interface Transaction {
  value: number;
  id: string;
  title: string;
  formattedValue: string;
  formattedDate: string;
  type: 'income' | 'outcome';
  category: { title: string };
  created_at: Date;
}

interface DataResponse {
  transactions: Transaction[];
  balance: Balance;
}

interface Balance {
  income: string;
  outcome: string;
  total: string;
}

const Dashboard: React.FC = () => {
  const history = useHistory();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<Balance>({} as Balance);

  useEffect(() => {
    async function loadTransactions(): Promise<void> {
      const { data } = await api.get<DataResponse>('/transactions');

      const formattedTransaction = data.transactions.map(transaction => {
        return {
          id: transaction.id,
          title: transaction.title,
          value: transaction.value,
          type: transaction.type,
          formattedValue: formatValue(transaction.value),
          formattedDate: Intl.DateTimeFormat('pt-Br').format(
            new Date(transaction.created_at),
          ),
          created_at: transaction.created_at,
          category: {
            title: transaction.category.title,
          },
        };
      });

      setTransactions(formattedTransaction);
      setBalance({
        income: formatValue(Number(data.balance.income)),
        outcome: formatValue(Number(data.balance.outcome)),
        total: formatValue(Number(data.balance.total)),
      });
    }

    loadTransactions();
  }, []);

  return (
    <>
      <Header path={history.location.pathname} />
      <Container>
        <CardContainer>
          <Card>
            <header>
              <p>Entradas</p>
              <img src={income} alt="Income" />
            </header>
            <h1 data-testid="balance-income">{balance.income}</h1>
          </Card>
          <Card>
            <header>
              <p>Saídas</p>
              <img src={outcome} alt="Outcome" />
            </header>
            <h1 data-testid="balance-outcome">{balance.outcome}</h1>
          </Card>
          <Card total>
            <header>
              <p>Total</p>
              <img src={total} alt="Total" />
            </header>
            <h1 data-testid="balance-total">{balance.total}</h1>
          </Card>
        </CardContainer>

        <TableContainer>
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Preço</th>
                <th>Categoria</th>
                <th>Data</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map(
                ({
                  id,
                  title,
                  formattedDate,
                  formattedValue,
                  category,
                  type,
                }) => (
                  <tr key={id}>
                    <td className="title">{title}</td>
                    <td className={type === 'income' ? 'income' : 'outcome'}>
                      {type === 'outcome' && '-'} {formattedValue}
                    </td>
                    <td>{category.title}</td>
                    <td>{formattedDate}</td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </TableContainer>
      </Container>
    </>
  );
};

export default Dashboard;
