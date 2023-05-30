import type { RouteProps } from 'react-router-dom';
import Finance from './pages/Finance';
import Rules from './pages/Rules';
import ActionTable from './pages/Rules/ActionTable';
import Test from './pages/Test';

const routes: RouteProps[] = [
  {
    id: 'Home',
    path: '/',
    Component: Finance,
  },
  {
    id: 'Actions',
    path: 'action',
    Component: ActionTable,
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
