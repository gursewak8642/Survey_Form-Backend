const express = require("express");
const morgan = require("morgan");
const Sequelize = require("sequelize");
const { DataTypes } = require("sequelize");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(morgan("dev"));
// app cors

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Database configuration
const dataBase = "surveys";
const username = "root";
const password = "root";

const sequelize = new Sequelize(dataBase, username, password, {
  host: "localhost",
  dialect: "mysql",
});
const User = sequelize.define(
  "Users",
  {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);
// Define Survey model
const Survey = sequelize.define(
  "Survey",
  {
    SurveyID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    Description: {
      type: DataTypes.TEXT,
    },
  },
  {
    timestamps: false,
  }
);
const Question = sequelize.define(
  "Question",
  {
    QuestionID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    SurveyID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Surveys",
        key: "SurveyID",
      },
    },
    QuestionText: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    QuestionNumber: {
      type: DataTypes.INTEGER,
    },
  },
  {
    timestamps: false,
  }
);
const AnswerOption = sequelize.define(
  "AnswerOption",
  {
    OptionID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    QuestionID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Questions", // This should match the table name of your Question model
        key: "QuestionID",
      },
    },
    OptionText: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    NextQuestionOdd: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Questions", // This should match the table name of your Question model
        key: "QuestionID",
      },
    },
    NextQuestionEven: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Questions", // This should match the table name of your Question model
        key: "QuestionID",
      },
    },
  },
  { timestamps: false }
);
const UserResponse = sequelize.define(
  "UserResponse",
  {
    ResponseID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    UserID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users", // This should match the table name of your User model
        key: "ID",
      },
    },
    QuestionID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Questions", // This should match the table name of your Question model
        key: "QuestionID",
      },
    },
    OptionID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "AnswerOptions", // This should match the table name of your AnswerOption model
        key: "OptionID",
      },
    },
  },
  { timestamps: false }
);
User.hasMany(UserResponse, { foreignKey: "UserID" });
UserResponse.belongsTo(User, { foreignKey: "UserID" });

Survey.hasMany(Question, { foreignKey: "SurveyID" });
Question.belongsTo(Survey, { foreignKey: "SurveyID" });

Question.hasMany(AnswerOption, { foreignKey: "QuestionID" });
AnswerOption.belongsTo(Question, { foreignKey: "QuestionID" });

Question.hasMany(UserResponse, { foreignKey: "QuestionID" });
UserResponse.belongsTo(Question, { foreignKey: "QuestionID" });

AnswerOption.hasMany(UserResponse, { foreignKey: "OptionID" });
UserResponse.belongsTo(AnswerOption, { foreignKey: "OptionID" });

// Define routes
app.post("/api/create-user", async (req, res) => {
  try {
    if (!req.body.name) {
      return res.status(400).json({ error: "Name is required" });
    }
    const user = await User.create({
      Name: req.body.name,
    });
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Error creating user" });
  }
});
//get user by id
app.get("/api/users/:userId", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId);
    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Error fetching user" });
  }
});
//get all users
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Error fetching users" });
  }
});
//create survey
app.post("/api/surveys", async (req, res) => {
  try {
    const survey = await Survey.create({
      Title: req.body.Title,
      Description: req.body.Description,
    });
    res.status(201).json(survey);
  } catch (err) {
    console.error("Error creating survey:", err);
    res.status(500).json({ error: "Error creating survey" });
  }
});

app.get("/api/surveys", async (req, res) => {
  try {
    const surveys = await Survey.findAll();
    res.status(200).json({ status: true, data: surveys });
  } catch (err) {
    console.error("Error fetching surveys:", err);
    res.status(500).json({ error: "Error fetching surveys" });
  }
});
//get  selcted survey questions

app.get("/api/questions/:surveryId", async (req, res) => {
  try {
    const questions = await Question.findAll({
      where: {
        SurveyID: req.params.surveryId,
      }
    });
    res.status(200).json({ status: true, data: questions });
  } catch (err) {
    console.error("Error fetching questions:", err);
    res.status(500).json({ error: "Error fetching questions" });
  }
});
//get all answer reltive  questionsId

app.get("/api/options/:questionId", async (req, res) => {
  try {
    const answerOptions = await AnswerOption.findAll({
      where: {
        QuestionID: req.params.questionId,
      },
    });
    res.status(200).json({ status: true, data: answerOptions });
  } catch (err) {
    console.error("Error fetching answerOptions:", err);
    res.status(500).json({ error: "Error fetching answerOptions" });
  }
});
//craete userResponse

app.post("/api/user-response", async (req, res) => {
  try {
    if (!req.body.UserID) {
      return res.status(400).json({ error: "UserID is required" });
    }
    if (!req.body.QuestionID) {
      return res.status(400).json({ error: "QuestionID is required" });
    }
    if (!req.body.OptionID) {
      return res.status(400).json({ error: "OptionID is required" });
    }
    const userResponse = await UserResponse.create({
      UserID: req.body.UserID,
      QuestionID: req.body.QuestionID,
      OptionID: req.body.OptionID,
    });
    res.status(201).json({ status: true, data: userResponse });
  } catch (err) {
    console.error("Error creating userResponse:", err);
    res.status(500).json({ error: "Error creating userResponse" });
  }
});
// Get all UserResponses by UserID with details
app.get("/api/userResponses/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const userResponses = await UserResponse.findAll({
      where: { UserID: userId },
      include: [
        {
          model: User,
          attributes: ["ID", "Name"],
        },
        {
          model: Question,
          attributes: [
            "QuestionID",
            "QuestionText",
            "SurveyID",
            "QuestionNumber",
          ],
        },
        {
          model: AnswerOption,
          attributes: [
            "OptionID",
            "OptionText",
            "QuestionID",
            "NextQuestionOdd",
            "NextQuestionEven",
          ],
        },
      ],
    });
    if (userResponses.length === 0) {
      return res
        .status(404)
        .json({ message: "No responses found for the given user ID" });
    }
    const userName = userResponses[0].User.Name;

    const formattedResponses = userResponses.map(response => {
      return {
        Question: response.Question.QuestionText,
        Answer: response.AnswerOption.OptionText
      };
    });

    res.status(200).json({ success: true, userName, data: formattedResponses });
  } catch (error) {
    console.error("Error fetching user responses:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Sync the model with the database
(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("Database synchronized");
  } catch (err) {
    console.error("Error synchronizing database:", err);
  }
})();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
