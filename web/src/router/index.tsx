import { createBrowserRouter } from 'react-router-dom';
import App from '../pages/App';
export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
    },
    {
        path: 'about',
        element: <div>About </div>,
    },
]);
