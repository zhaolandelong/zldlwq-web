import type { RouteProps } from 'react-router-dom';
import Finance from './pages/Finance';
import AdditionTable from './pages/AdditionTable';
import Test from './pages/Test';

const routes: RouteProps[] = [
  {
    id: 'Home',
    path: '/',
    Component: Finance,
  },
  {
    id: 'Addition',
    path: 'addition',
    Component: AdditionTable,
  },
  {
    id: 'Test',
    path: 'test',
    Component: Test,
  },
];

export default routes;
