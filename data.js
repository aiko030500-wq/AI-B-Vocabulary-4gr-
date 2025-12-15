// data.js — Top Stars 4 KZ — Visual Vocabulary
// ВАЖНО: картинки клади в /img, аудио (если нужно) в /audio

window.APP_DATA = {
  appTitle: "Top Stars 4 KZ — Visual Vocabulary",
  // ЛОГИНЫ можно поменять под твой класс
  allowedLogins: Array.from({ length: 15 }, (_, i) => `4GL${i + 1}`),
  studentPin: "2844",
  teacherPin: "3244",

  // КНИГА: структура сделана как "Modules → Lessons → Words"
  modules: [
    {
      id: "m1",
      title: "Module 1",
      color: "green",
      lessons: [
        {
          id: "m1l1",
          title: "Lesson 1",
          words: [
            // ПРИМЕРЫ (замени на слова из учебника)
            { en: "school", ru: "школа", img: "img/school.png", audio: "audio/school.mp3" },
            { en: "pencil", ru: "карандаш", img: "img/pencil.png", audio: "" },
          ],
        },
        { id: "m1l2", title: "Lesson 2", words: [] },
        { id: "m1l3", title: "Lesson 3", words: [] },
        { id: "m1l4", title: "Lesson 4", words: [] },
        { id: "m1l5", title: "Lesson 5", words: [] },
        { id: "m1l6", title: "Lesson 6", words: [] },
        { id: "m1l7", title: "Lesson 7", words: [] },
        { id: "m1l8", title: "Lesson 8", words: [] },
      ],
    },

    // Сразу заготовка до 8 модулей (можешь увеличить/уменьшить)
    { id: "m2", title: "Module 2", color: "green", lessons: mkLessons("m2") },
    { id: "m3", title: "Module 3", color: "green", lessons: mkLessons("m3") },
    { id: "m4", title: "Module 4", color: "green", lessons: mkLessons("m4") },
    { id: "m5", title: "Module 5", color: "green", lessons: mkLessons("m5") },
    { id: "m6", title: "Module 6", color: "green", lessons: mkLessons("m6") },
    { id: "m7", title: "Module 7", color: "green", lessons: mkLessons("m7") },
    { id: "m8", title: "Module 8", color: "green", lessons: mkLessons("m8") },
  ],
};

function mkLessons(prefix){
  return Array.from({length:8}, (_,i)=>({
    id: `${prefix}l${i+1}`,
    title: `Lesson ${i+1}`,
    words: []
  }));
}
