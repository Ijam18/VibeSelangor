import React from 'react'
import ReactDOM from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import App from './App.jsx'
import './index.css'

const RootWrapper = import.meta.env.DEV ? React.Fragment : React.StrictMode

ReactDOM.createRoot(document.getElementById('root')).render(
    <RootWrapper>
        <App />
        <Analytics />
    </RootWrapper>,
)
