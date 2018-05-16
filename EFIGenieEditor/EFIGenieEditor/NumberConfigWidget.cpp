#include "NumberConfigWidget.h"

NumberConfigWidget::~NumberConfigWidget()
{
	delete ConfigValue;
}

NumberConfigWidget::NumberConfigWidget(const char * name, const char * units, double min, double max, double value, int decimals, double multiplier, std::string type)
{
	Type = type;
	Multiplier = multiplier;
	ConfigValue = malloc(configSize());

	QGridLayout *layout = new QGridLayout;
	layout->setSpacing(5);
	layout->setMargin(0);

	Label = new QLabel(QString(name));
	Label->setFixedSize(300, 25);
	layout->addWidget(Label, 0, 0);

	UnitLabel = new QLabel(QString(units));
	UnitLabel->setFixedSize(100, 25);
	layout->addWidget(UnitLabel, 0, 2);

	SpinBox = new QDoubleSpinBox();
	SpinBox->setMinimum(min);
	SpinBox->setMaximum(max);
	SpinBox->setValue(value);
	SpinBox->setFixedSize(100, 25);
	SpinBox->setDecimals(decimals);
	layout->addWidget(SpinBox, 0, 1);
	SpinBox->installEventFilter(this);

	setLayout(layout);
}

void * NumberConfigWidget::getValue()
{
	return &Value;
}

void NumberConfigWidget::setValue(void *val)
{
	SpinBox->setValue(*((double *)val));
	Value = *((double *)val);
	double scaledValue = Value / Multiplier;
	CopyDoubleToLocationType(Type, ConfigValue, &scaledValue);
}

void * NumberConfigWidget::getConfigValue()
{
	return ConfigValue;
}

void NumberConfigWidget::setConfigValue(void *val)
{
	double scaledValue = 0;
	CopyTypeToLocationDouble(Type, &scaledValue, val);
	double value = scaledValue * Multiplier;
	setValue(&value);
}

unsigned int NumberConfigWidget::configSize()
{
	return SizeOfType(Type);
}

bool NumberConfigWidget::isConfigPointer()
{
	return false;
}

std::string NumberConfigWidget::getConfigType()
{
	return Type;
}

bool NumberConfigWidget::eventFilter(QObject *watched, QEvent *e)
{
	double val = SpinBox->value();
	setValue(&val);
	return false;
}