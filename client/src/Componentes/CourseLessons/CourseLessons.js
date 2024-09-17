import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import style from "./courseLessons.module.css";
import NavBar from "../NavBar/NavBar";
import Footer from "../Footer/Footer";
import {
  getCoursesById,
  getAllClasses,
  allUser,
  createReview,
  getAllReviews,
} from "../../redux/actions";
import LessonsList from "../LessonsList/LessonsList";
import LessonsVideo from "./../LessonsVideo/LessonsVideo";
import { Link, useNavigate } from "react-router-dom";

export default function CourseLessons() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const course = useSelector((state) => state.courseDetail);
  const loggedUserId = useSelector((state) => state.loggedUsers);
  // const allUsers = useSelector((state) => state.user);
  const allReviews = useSelector((state) => state.reviews);
  // const user = allUsers.find((e) => e.id === loggedUserId[0]);
  const user = useSelector((state) => state.userDetail);

  const totalClasses = useSelector((state) => state.classes);

  const navigate = useNavigate();

  let myBuys = user.buys ? user.buys.map((buy) => buy) : [];
  let myBuysThisCourse = myBuys.filter((buy) => buy.courseId === id);
  let myBuy = myBuysThisCourse.length > 0 ? myBuysThisCourse[0] : null;
  let courseClasses =
    myBuysThisCourse[0] && myBuysThisCourse[0].clases.map((clase) => clase);
  console.log(myBuy, "myBuy");

  const instructorClases = totalClasses.filter((c) => c.courseId === course.id);
  console.log(course, "course");
  console.log(courseClasses, "courseClasses");
  console.log(user, "esto es user");
  console.log(allReviews, "esto es reviews");
  const [currentLesson, setCurrentLesson] = useState({});
  const [form, setForm] = useState(false);
  const [review, setReview] = useState({
    idCourse: id,
    score: "",
    coment: "",
    userName: user.name,
    userId: user.id,
  });

  console.log(review);

  useEffect(() => {
    dispatch(getCoursesById(id));
  }, []);

  useEffect(() => dispatch(getAllClasses()), []);
  useEffect(() => dispatch(allUser()), []);
  useEffect(() => dispatch(getAllReviews()), []);

  function handleClose(e) {
    e.preventDefault(e);
    setForm(false);
  }

  function handleChange(e) {
    e.preventDefault(e);
    setReview({
      ...review,
      [e.target.name]: e.target.value,
    });
  }

  function handleSubmit(e) {
    e.preventDefault(e);
    const prevCourse = allReviews.filter((e) => e.idCourse === id);
    const prevReview = prevCourse.filter((e) => e.userId === user.id);
    if (!prevReview.length) {
      if (review.score && review.coment) {
        dispatch(createReview(review));
        alert("Calificación enviada.");
        dispatch(getAllReviews());
        setForm(false);
        setReview({
          score: "",
          coment: "",
        });
      } else {
        alert("Por favor seleccione un puntaje y deje su comentario.");
      }
    } else {
      alert("Ya calificaste este curso! Sólo podes hacerlo una vez.");
      setForm(false);
    }
  }

  function resetCurrentLesson() {
    setCurrentLesson({});
  }

  return (
    <div>
      <NavBar />

      <div className={form === false ? style.container : style.hiddenContainer}>
        <div className={style.body2}>
          <div className={style.title}>
            <h1 onClick={() => resetCurrentLesson()}>{course.name} </h1>

            {user.roles[0].tipo === "instructor" ? (
              <h3
                style={
                  course.state === "passed"
                    ? { color: "green" }
                    : { color: "red" }
                }
              >
                {course.state === "inprocess"
                  ? "(Estado: En revision)"
                  : course.state === "reject"
                  ? "(Estado: rechazado)"
                  : "(Estado: Aprobado)"}
              </h3>
            ) : null}
          </div>
        </div>

        <div className={style.body}>
          <div className={style.left}>
            <LessonsVideo
              lessons={courseClasses}
              currentLesson={currentLesson}
              setCurrentLesson={setCurrentLesson}
              course={course}
              user={user}
              idCourse={id}
            />
          </div>
          <div className={style.right}>
            <LessonsList
              myBuy={myBuy}
              lessons={courseClasses}
              form={form}
              setForm={setForm}
              setCurrentLesson={setCurrentLesson}
              user={user}
              instructorClases={instructorClases}
            />
          </div>
        </div>
      </div>

      <Footer />
      <div>
        <main className={form ? style.visible : style.hidden}>
          <button className={style.close} onClick={handleClose}>
            Cerrar
          </button>
          <h4>Calificar el curso de {course.name}</h4>

          <label>¿Qué puntaje le das?</label>
          <div className={style.calif}>
            <div className={style.star}>
              <p>⭐</p>
              <input
                type="radio"
                name="score"
                value="1"
                onChange={handleChange}
              />
            </div>
            <div className={style.star}>
              <p>⭐⭐</p>
              <input
                type="radio"
                name="score"
                value="2"
                onChange={handleChange}
              />
            </div>
            <div className={style.star}>
              <p>⭐⭐⭐</p>
              <input
                type="radio"
                name="score"
                value="3"
                onChange={handleChange}
              />
            </div>
            <div className={style.star}>
              <p>⭐⭐⭐⭐</p>
              <input
                type="radio"
                name="score"
                value="4"
                onChange={handleChange}
              />
            </div>
            <div className={style.star}>
              <p>⭐⭐⭐⭐⭐</p>
              <input
                type="radio"
                name="score"
                value="5"
                onChange={handleChange}
              />
            </div>
            <br />
            <br />
          </div>
          <label>Contanos tu experiencia</label>
          <textarea
            placeholder="Escribe tu comentario.."
            name="coment"
            value={review.coment}
            onChange={handleChange}
          />
          <button className={style.send} onClick={handleSubmit}>
            Enviar
          </button>
        </main>
      </div>
    </div>
  );
}
