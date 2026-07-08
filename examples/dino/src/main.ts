import { mount } from 'svelte'
import App from './App.svelte'
import './app.css'

console.log('🦕 Dino Runner — svelte-phaser edition loaded!')

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
