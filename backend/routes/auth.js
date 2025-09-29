const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');


router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'Usuário já existe.' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ msg: 'Usuário registrado com sucesso!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor.');
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Credenciais inválidas.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Credenciais inválidas.' });

    const payload = { id: user.id, name: user.name };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor.');
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ msg: 'Se um e-mail correspondente for encontrado, um link de redefinição será enviado.' });
    }

    const resetSecret = process.env.JWT_SECRET + user.password;
    const resetToken = jwt.sign({ id: user.id }, resetSecret, { expiresIn: '15m' });
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${user.id}/${resetToken}`;

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Gerenciador Financeiro" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Redefinição de Senha',
      html: `<p>Olá ${user.name},</p><p>Você solicitou a redefinição de sua senha. Clique no link a seguir para criar uma nova:</p><p><a href="${resetLink}">Redefinir Senha</a></p><p>Este link é válido por 15 minutos.</p>`,
    });

    res.json({ msg: 'Se um e-mail correspondente for encontrado, um link de redefinição será enviado.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor.');
  }
});

router.post('/reset-password/:id/:token', async (req, res) => {
  const { password } = req.body;
  const { id, token } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(400).json({ msg: "Link inválido ou expirado." });

    const resetSecret = process.env.JWT_SECRET + user.password;
    jwt.verify(token, resetSecret);

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    res.json({ msg: 'Senha redefinida com sucesso!' });
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ msg: 'Link inválido ou expirado. Tente novamente.' });
  }
});

module.exports = router;