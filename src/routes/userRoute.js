import express, {Router} from 'express';

const router = Router();

router.get('/', (_req, res) => {
    res.json({ message: "User checked" });
});

export default router;