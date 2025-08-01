import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class response_3_2_2 extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'criteria_master',
        key: 'id'
      }
    },
    sl_no: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
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
    teacher_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    book_chapter_title: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    paper_title: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    conference_title: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    year_of_publication: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isbn_issn_number: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    institution_affiliated: {
      type: DataTypes.ENUM('Yes','No'),
      allowNull: true
    },
    publisher_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    submitted_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'response_3_2_2',
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
        name: "idx_r322_criteria",
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
