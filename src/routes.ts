import type { RouteProps } from 'react-router-dom';
import Finance from './pages/Finance';
import Rules from './pages/Rules';
import Test from './pages/Test';

const routes: RouteProps[] = [
  {
    id: 'Home',
    path: '/',
    Component: Finance,
  },
  {
    id: 'Rules',
    path: 'rules',
    Component: Rules,
  },
  {
    id: 'Test',
    path: 'test',
    Component: Test,
  },
];

export default routes;
