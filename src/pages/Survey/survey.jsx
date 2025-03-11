import styles from "./survey.module.css";

const Survey = () => {
  return (
    <div className={styles["container-wrapper"]}>
      <div className={styles.container}>
        <h1>Anketlər</h1>
        <div className={styles.cards}>
          <div className={styles.card}>
            <div className={styles["card-content"]}>
              <h2 className={styles["card-title"]}>
                Yeni məhsul dəyərləndirmə anketi
              </h2>
            </div>
            <a
              href="https://docs.google.com/forms/d/1mXi_HSL49sDlv9YuXkVVu68C1lPJ_TU6LgnpJojqBRA/edit"
              target="_blank"
              rel="noopener noreferrer"
            >
              Yeni məhsul dəyərləndirmə anketi
            </a>
          </div>

          <div className={styles.card}>
            <div className={styles["card-content"]}>
              <h2 className={styles["card-title"]}>
                Kampaniya məmnunluq anketi
              </h2>
            </div>
            <a
              href="https://docs.google.com/forms/d/1qzf0-2AQow5bYWD6qAV4teio8k6My6PB2B0zjtFqUQ0/edit"
              target="_blank"
              rel="noopener noreferrer"
            >
              Kampaniya məmnunluq anketi
            </a>
          </div>

          <div className={styles.card}>
            <div className={styles["card-content"]}>
              <h2 className={styles["card-title"]}>
                Distribitor xidmət dəyərləndirmə anketi
              </h2>
            </div>
            <a
              href="https://docs.google.com/forms/d/1-HBAY8ZibdEXNZb3of0z5zqpCQ_wxCohTNV3CXg6CSI/edit"
              target="_blank"
              rel="noopener noreferrer"
            >
              Distribitor xidmət dəyərləndirmə anketi
            </a>
          </div>

          <div className={styles.card}>
            <div className={styles["card-content"]}>
              <h2 className={styles["card-title"]}>
                Mövcud məhsul dəyərləndirmə anketi
              </h2>
            </div>
            <a
              href="https://docs.google.com/forms/d/1CYakDsuKENPT-4QGHcZoDBDt3Zx5xyvGXgQ7KZxd16U/edit"
              target="_blank"
              rel="noopener noreferrer"
            >
              Mövcud məhsul dəyərləndirmə anketi
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Survey;
