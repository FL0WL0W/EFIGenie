#include "BoolConfigWidget.h"

BoolConfigWidget::BoolConfigWidget(const char * name, bool value)
{
	QGridLayout *layout = new QGridLayout;
	layout->setSpacing(5);
	layout->setMargin(0);

	Label = new QLabel(QString(name));
	Label->setFixedSize(300, 25);
	layout->addWidget(Label, 0, 0);
	
	CheckBox = new QCheckBox();
	CheckBox->setFixedSize(100, 25);
	layout->addWidget(CheckBox, 0, 1);

	setLayout(layout);
}

void * BoolConfigWidget::getValue()
{
	bool val = CheckBox->isChecked();
	return &val;
}

void BoolConfigWidget::setValue(void *val)
{
	CheckBox->setChecked((bool)val);
}

void * BoolConfigWidget::getConfigValue()
{
	unsigned char val = (bool)CheckBox->isChecked();
	return &val;
}

void BoolConfigWidget::setConfigValue(void *val)
{
	CheckBox->setChecked((bool)((int)val));
}

unsigned int BoolConfigWidget::configSize()
{
	return sizeof(unsigned char);
}

bool BoolConfigWidget::isConfigPointer()
{
	return false;
}

std::string BoolConfigWidget::getConfigType()
{
	return "bool";
}