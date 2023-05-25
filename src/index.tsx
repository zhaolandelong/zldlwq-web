import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import './index.css';
import 'antd/dist/reset.css';
import reportWebVitals from './reportWebVitals';
import routes from './routes';
import { Layout, Menu } from 'antd';

const { Header, Footer, Content } = Layout;

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Router>
      <Layout className="layout">
        <Header style={{ height: 30, lineHeight: '30px' }}>
          <Menu theme="dark" mode="horizontal">
            {routes.map((route) => (
              <Menu.Item key={route.id}>
                <NavLink to={route?.path ?? '/'}>{route.id}</NavLink>
              </Menu.Item>
            ))}
          </Menu>
        </Header>
        <Content style={{ padding: '0 50px' }}>
          <Routes>
            {routes.map((route) => (
              <Route key={route.id} {...route} />
            ))}
          </Routes>
        </Content>
        <Footer style={{ textAlign: 'center' }}>Powered by Dylan</Footer>
      </Layout>
    </Router>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
