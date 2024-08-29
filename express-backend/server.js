import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './Routes/Auth.js';
import msgContactRouter from './Routes/msgContact.js';
import tests from './Routes/Tests.js';
import profile from './Routes/profile.js'
import comments from './Routes/Comments.js'
import Attestations from './Routes/Attestation.js';
import Users from './Routes/Users.js';
import compression from 'compression';


//medllwares
const app = express();
const port = 5000;
app.use(cors({
  origin:"http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use((req,res,next)=>{
  res.header("Access-Control-Allow-Credentials", true)
  next()
});
app.use(compression());


app.use('', authRoutes);
app.use('', msgContactRouter);
app.use('', tests);
app.use('', profile);
app.use('', comments);
app.use('', Attestations);
app.use('', Users);

app.use('/testsImg', express.static('uploads'));

app.use('/uploads', express.static('uploads'));


export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

