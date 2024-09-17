import React from "react";
import { Link, useNavigate } from "react-router-dom";
import style from "./FormularioRegistro.module.css";
import { useDispatch, useSelector } from "react-redux";
import { createUser, allUser } from "../../redux/actions/index";
import GoogleLogin from "react-google-login";
import googleIcon from "../../Images/googleIcon.png";
import generator from "generate-password";

export function validation(form) {
  let errors = {};
  // console.log(errors);

  // USUARIO-(NAME)

  if (!form.name) {
    errors.name = "Ingrese su nombre";
  } else if (form.name.match(!/^([a-zA-Z]+)(\s[a-zA-Z]+)*$/)) {
    errors.name = "No se admiten caracteres especiales.";
  }

  // USUARIO-(EMAIL)

  if (!form.email) {
    errors.user = "Se requiere un correo electrónico";
  } else if (
    !form.email.match(
      /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
    )
  ) {
    errors.email = "Por favor ingrese un correo electrónico válido.";
  }

  // PASSWORD (CONTRASEÑA ALFANUMERICO)

  if (!form.password) {
    errors.password = "Por favor ingrese una contraseña.";
  } else if (
    !form.password.match(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z])\S{5,15}/
    )
  ) {
    errors.password =
      "La contraseña debe contener entre 5 y 15 caracteres, al menos una mayúscula, una minúscula un número, y un caracter especial.";
  }

  // CONFIRMACION-PASSWORD

  if (form.password !== form.confirmacionPassword) {
    errors.confirmacionPassword = "Las contraseñas ingresadas no coinciden";
  }

  if (!form.role || form.role === "Quiero ser") {
    errors.role = "Tiene que elegir una opcion";
  }

  return errors;
}

export default function FormularioRegistro() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const users = useSelector((state) => state.user);
  const [errors, setErrors] = React.useState({});

  const [form, setForm] = React.useState({
    name: "",
    password: "",
    email: "",
    image: "",
    role: "",
    confirmacionPassword: "",
    banned: "false",
  });

  const handleInputChange = function(e) {
    console.log(e);

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setErrors(
      validation({
        ...form,
        [e.target.name]: e.target.value,
      })
    );
  };

  const handleOnSubmit = (event) => {
    event.preventDefault();
    if (!form.name || !form.password || !form.email) {
      alert("Debes rellenar todos los campos antes de registrarte");
    } else {
      if (Object.keys(errors).length === 0) {
        dispatch(createUser(form));

        navigate(`/registerok`);
      }
    }
  };
  function handleSelect2(e) {
    setForm({
      ...form,
      role: e.target.value,
    });
    setErrors(
      validation({
        ...form,
        role: e.target.value,
      })
    );
  }

  const passwordGenerate = generator.generate({
    length: 10,
    numbers: true,
  });

  const user = {
    name: "",
    password: passwordGenerate,
    email: "",
    image: "",
    role: "alumno",
    banned: "false",
  };

  const handleSucces = (response) => {
    const searchUser = users.find((u) => u.email === response.profileObj.email);
    if (searchUser === undefined) {
      user.name = response.profileObj.name;
      user.email = response.profileObj.email;
      user.image = response.profileObj.imageUrl;
      dispatch(createUser(user));
      dispatch(allUser());
      navigate(`/registerok`);
    } else {
      alert("Ese usuario ya se encuentra registrado");
    }
  };

  const handleFailure = () => {};

  return (
    <div className={style.container}>
      <div className={style.logo}>
        <Link to="/home">
          <h1>AkademIT</h1>
        </Link>
      </div>
      <div className={style.title}>
        <h2>Formulario de Registro</h2>
        <form class={style.form} onSubmit={(e) => handleOnSubmit(e)}>
          {/* <div class={style.containerInput}> */}
          <div class={style.SubcontainerInput}>
            <label>Nombre</label>
            <input
              placeholder="Ingresa tu nombre..."
              type="text"
              name="name"
              autoComplete="off"
              onChange={handleInputChange}
              value={form.name}
            />
          </div>
          {errors.name && <p>{errors.name}</p>}

          <div class={style.SubcontainerInput}>
            <label>E-mail</label>
            <input
              placeholder="Ingresa tu e-mail..."
              type="text"
              name="email"
              autoComplete="off"
              onChange={handleInputChange}
              value={form.email}
            />
          </div>
          {errors.email && <p>{errors.email}</p>}

          <div class={style.SubcontainerInput}>
            <label>Contraseña</label>
            <input
              placeholder="Ingresa tu contraseña ..."
              type="Password"
              name="password"
              autoComplete="off"
              onChange={handleInputChange}
              value={form.password}
            />
          </div>
          {errors.password && <p>{errors.password}</p>}

          <div class={style.SubcontainerInput}>
            <label>Confirma tu contraseña</label>
            <input
              placeholder="Ingresa tu contraseña ..."
              type="Password"
              name="confirmacionPassword"
              onChange={handleInputChange}
              autoComplete="off"
              value={form.confirmacionPassword}
            />
          </div>
          {errors.confirmacionPassword && <p>{errors.confirmacionPassword}</p>}

          <div class={style.SubcontainerInput}>
            <br></br>
            <label>Imagen URL (opcional)</label>
            <input
              placeholder="Ingresa tu imagen"
              type="url"
              name="img"
              autoComplete="off"
              onChange={handleInputChange}
              value={form.img}
            />
          </div>

          <div class={style.SubcontainerInputRole}>
            {/* <label class={style.role}>Role</label> */}
            <select class={style.role} onChange={(e) => handleSelect2(e)}>
              <option value="Role">Quiero ser</option>
              <option value="instructor">Instructor</option>
              <option value="alumno">Alumno</option>
            </select>
          </div>
          {errors.role && <p>{errors.role}</p>}
          {/* </div> */}

          <button class={style.buttonYellow} type="submit">
            Registrarme{" "}
          </button>
          <GoogleLogin
            clientId="275221104976-ao35sbaekv1sb9d5g904v51k0uescmbf.apps.googleusercontent.com"
            render={(renderProps) => (
              <button
                className={style.google}
                class={style.buttonRegistro}
                onClick={renderProps.onClick}
                disabled={renderProps.disabled}
              >
                <img src={googleIcon} alt="" />
                Registro con Google
              </button>
            )}
            onSuccess={handleSucces}
            onFailure={handleFailure}
            cookiePolicy={"single_host_origin"}
          />
          <Link to="/home">
            <button class={style.buttonYellow}>Volver</button>
          </Link>
        </form>
      </div>
    </div>
  );
}
