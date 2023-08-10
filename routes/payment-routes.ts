import {Router} from  'express'

const router = Router()

router.get('/create-order', (req, res) => res.send('creating order'));

router.get('/succes', (req, res) => res.send('succes order'));

router.get('/webhook', (req, res) => res.send('webhook'));

export default router
