import React, {useState, useEffect} from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import axios from "axios";
import { ToastContainer, toast, Zoom, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function SignIn({history}) {
  const classes = useStyles();
  const [username, setUsername] =useState("");
  const [password, setPassword] =useState("");
  const [errors, setErrors] = useState("");

  useEffect(() => {
    if (localStorage.getItem("authToken")) {
        window.location.href = '/';
    }
  }, [history]);

  //popping error
  const popError = (errorMessage) => {

    toast.error(errorMessage, {
      className :"error-toast",
      position:toast.POSITION.TOP_RIGHT
    });
  }

  //handle login
  const LoginSubmit = async (e) => {
  
    e.preventDefault();

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      const { data } = await axios.post(
        "https://teams-clone-backend.herokuapp.com/user/login",
        { username, password },
        config
      );
     
      
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("username", data.username)
      window.location.href = '/';
    } catch (error) {
      popError(error.response.data.error);
      console.log(error.response.data.error);
      setTimeout(() => {
        setErrors("");
      }, 5000);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
     <>
      <ToastContainer
      draggable ={false}
      autoClose={3000}
      ></ToastContainer>

      </>
      <CssBaseline />
      <div className={classes.paper}>
      <Avatar className={classes.avatar}  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAe1BMVEX0QzZMr1AhlvP/wQf/////vgD0Nia63LtAq0Ww0vkAkfP/4636uLRJrk3/+Pj6saz2bWT1TEBVs1l0v3e027X4/Pn8zsv0PzLQ6NEsm/T/xBVWrPX/zUim0Pr/4qD3+//H4vz/7cPzJg8zqDj94N7h7+Hd6/z/8tsAjPI036d3AAABpElEQVR4nO3cSU5CURBA0fr4aBVFAcWGxt79r1CIEzFx+Ovlk3M3UDmppIYVpZTLq9l1tN3govxuOGra7ma+WO4nRSm3MbhrHVhB2ExHzeogvM3wVREejKsSl5ECrCNsps0yrgYpwErCZrSIWc4Kawmn82j/ilYVNjdJvnrChpCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQ8F/hIKmXP8LXUVJxkdXbkfB9mFWUU4+w+xF2P8LuR9j9CLsfYfeLcVYfR3M/z7OKSVJf4yPheT+r6CU1+Ss8S4qQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkPBf4f2JCx/i8cSFT7GenLSwv4ltDrDaDpdRdjlLrCPsPx8+lu96GcYawv7Z889P9u36sf2Lmi98eNos95O+AYpCk2OCi44MAAAAAElFTkSuQmCC">
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign In
        </Typography>
        <form className={classes.form}  onSubmit={LoginSubmit}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            value ={username}
            onChange ={(e) => setUsername(e.target.value)}
            autoFocus
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            value ={password}
            onChange ={(e) => setPassword(e.target.value)}
            label="Password"
            type="password"
            id="password"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            Sign In
          </Button>
          <Grid container>
            <Grid item xs>
              <Link href="#" variant="body2">
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link href="#" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
    </Container>
  );
}