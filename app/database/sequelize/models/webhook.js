module.exports = (sequelize, DataTypes) => {
  const Webhook = sequelize.define('webhook', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    event: DataTypes.STRING,
    target: DataTypes.STRING,
    conditions: DataTypes.JSON,
    secret: {
      unique: true,
      type: DataTypes.STRING
    },
    enabled: DataTypes.BOOLEAN
  }, {})

  return Webhook
}
