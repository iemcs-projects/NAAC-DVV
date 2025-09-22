import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class response_2_7_1 extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    sl_no: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'criteria_master',
        key: 'id'
      }
    },
    criteria_code: {
      type: DataTypes.STRING(20),
      allowNull: true,
      references: {
        model: 'criteria_master',
        key: 'criteria_code'
      }
    },
    session: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    name_of_the_student: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    gender: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    state_of_domicile: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    nationality_if_other_than_indian: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    email_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    program_name: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    unique_enrolment_id_college_id: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    mobile_number: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    year_of_joining: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    q1_syllabus_coverage: {
      type: DataTypes.ENUM('0','1','2','3','4'),
      allowNull: true
    },
    q2_teacher_preparedness: {
      type: DataTypes.ENUM('0','1','2','3','4'),
      allowNull: true
    },
    q3_teacher_communication: {
      type: DataTypes.ENUM('0','1','2','3','4'),
      allowNull: true
    },
    q4_teaching_approach: {
      type: DataTypes.ENUM('0','1','2','3','4'),
      allowNull: true
    },
    q5_internal_evaluation_fairness: {
      type: DataTypes.ENUM('0','1','2','3','4'),
      allowNull: true
    },
    q6_assignment_discussion: {
      type: DataTypes.ENUM('0','1','2','3','4'),
      allowNull: true
    },
    q7_internship_support: {
      type: DataTypes.ENUM('0','1','2','3','4'),
      allowNull: true
    },
    q8_mentoring_growth: {
      type: DataTypes.ENUM('0','1','2','3','4'),
      allowNull: true
    },
    q9_learning_opportunities: {
      type: DataTypes.ENUM('0','1','2','3','4'),
      allowNull: true
    },
    q10_competency_info: {
      type: DataTypes.ENUM('0','1','2','3','4'),
      allowNull: true
    },
    q11_mentor_followup: {
      type: DataTypes.ENUM('0','1','2','3','4'),
      allowNull: true
    },
    q12_examples_usage: {
      type: DataTypes.ENUM('0','1','2','3','4'),
      allowNull: true
    },
    q13_strengths_identification: {
      type: DataTypes.ENUM('0','1','2','3','4'),
      allowNull: true
    },
    q14_weakness_support: {
      type: DataTypes.ENUM('0','1','2','3','4'),
      allowNull: true
    },
    q15_student_engagement: {
      type: DataTypes.ENUM('0','1','2','3','4'),
      allowNull: true
    },
    q16_student_centric_methods: {
      type: DataTypes.ENUM('0','1','2','3','4'),
      allowNull: true
    },
    q17_extracurricular_encouragement: {
      type: DataTypes.ENUM('0','1','2','3','4'),
      allowNull: true
    },
    q18_softskills_training: {
      type: DataTypes.ENUM('0','1','2','3','4'),
      allowNull: true
    },
    q19_ict_usage: {
      type: DataTypes.ENUM('0','1','2','3','4'),
      allowNull: true
    },
    q20_teaching_learning_quality: {
      type: DataTypes.ENUM('0','1','2','3','4'),
      allowNull: true
    },
    q21_suggestions: {
      type: DataTypes.STRING(1000),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'response_2_7_1',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "sl_no" },
        ]
      },
      {
        name: "idx_r271_criteria",
        using: "BTREE",
        fields: [
          { name: "criteria_code" },
          { name: "id" },
        ]
      },
    ]
  });
  }
}
