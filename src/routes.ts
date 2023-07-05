import type { RouteProps } from 'react-router-dom';
import Finance from './pages/Finance';
import Rules from './pages/Rules';
import Test from './pages/Test';
import Stagging from './pages/Stagging';

const routes: (RouteProps & { name: string })[] = [
  {
    name: '首页',
    path: '/',
    Component: Finance,
  },
  {
    name: '打新',
    path: 'stagging',
    Component: Stagging,
  },
  {
    name: '规则',
    path: 'rules',
    Component: Rules,
  },
  {
    name: '测试',
    path: 'test',
    Component: Test,
  },
];

export default routes;
