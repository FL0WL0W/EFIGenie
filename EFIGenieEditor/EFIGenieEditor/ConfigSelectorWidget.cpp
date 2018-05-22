#include <ConfigSelectorWidget.h>

ConfigSelectorWidget::ConfigSelectorWidget(int serviceId, bool isConfigPointer, bool isStatic, std::map<int, std::map<unsigned char, std::pair<std::string, std::string>>> definitions, int maxHeight)
{
	IsStatic = isStatic;
	IsConfigPointer = isConfigPointer;
	MaxHeight = maxHeight;
	Definitions = definitions;
	std::map<int, std::map<unsigned char, std::pair<std::string, std::string>>>::iterator typeIt = Definitions.find(serviceId);
	TypeDefinitions = typeIt->second;

	Selection = new QComboBox();
	
	for (std::map<unsigned char, std::pair<std::string, std::string>>::iterator it = TypeDefinitions.begin(); it != TypeDefinitions.end(); ++it)
	{
		Selection->addItem(QString(it->second.first.c_str()), QVariant((int)it->first));
	}

	setServiceId(TypeDefinitions.begin()->first);

	QGridLayout *SelectionLayout = new QGridLayout();

	QWidget * padding2 = new QWidget();
	padding2->setFixedSize(5, 5);
	SelectionLayout->addWidget(padding2, 0, 0);
	QWidget * padding = new QWidget();
	padding->setMinimumSize(510, 5);
	SelectionLayout->addWidget(padding, 0, 1);
	QWidget * padding3 = new QWidget();
	padding3->setFixedSize(5, 5);
	SelectionLayout->addWidget(padding3, 0, 2);
	SelectionLayout->setColumnStretch(1, 100);

	SelectionLayout->addWidget(Selection, 1, 1);
	SelectionLayout->setMargin(0);
	SelectionLayout->setSpacing(0);
	
	if(!isStatic)
		layout->addLayout(SelectionLayout, 1, 0);
	layout->setMargin(0);
	layout->setSpacing(0);

	setLayout(layout);
	layout->setSizeConstraint(QLayout::SetFixedSize);

	connect(Selection, SIGNAL(currentIndexChanged(int)), this, SLOT(currentIndexChanged(int)));
}

void ConfigSelectorWidget::currentIndexChanged(int index)
{
	setServiceId(Selection->itemData(index).toInt());
}

void ConfigSelectorWidget::setServiceId(int serviceId)
{
	std::map<unsigned char, std::pair<std::string, std::string>>::iterator it = TypeDefinitions.find(serviceId);
	if (it == TypeDefinitions.end())
		return;

	if (configWidget != 0)
	{
		if (Selection->currentData().toInt() == ServiceId)
		{
			return;
		}
		layout->removeWidget(configWidget);
		delete configWidget;
	}

	std::string definition = it->second.second;
	configWidget = new ConfigWidget(definition, IsConfigPointer, Definitions, MaxHeight);

	layout->addWidget(configWidget, 2, 0);
	ServiceId = serviceId;
}

void * ConfigSelectorWidget::getValue()
{
	throw;
}

void ConfigSelectorWidget::setValue(void *)
{
	throw;
}

void * ConfigSelectorWidget::getConfigValue()
{
	if (IsStatic)
	{
		return configWidget->getConfigValue();
	}

	void * val = malloc(configSize());
	void * buildVal = val;
	*((unsigned char *)val) = Selection->currentData().toInt();

	buildVal = (void *)((unsigned char *)buildVal + 1);

	void * configValue = configWidget->getConfigValue();

	memcpy(buildVal, configValue, configWidget->configSize());

	delete configValue;

	return val;
}

void ConfigSelectorWidget::setConfigValue(void *val)
{
	if (IsStatic)
	{
		configWidget->setConfigValue(val);
		return;
	}

	unsigned char serviceId = *((unsigned char *)val);

	for (int i = 0; i < Selection->count(); i++)
	{
		if (Selection->itemData(i).toInt() == serviceId)
		{
			Selection->setCurrentIndex(i);
			setServiceId(serviceId);
			break;
		}
	}

	configWidget->setConfigValue((void *)((unsigned char *)val + 1));
}

unsigned int ConfigSelectorWidget::configSize()
{
	if (IsStatic)
		return configWidget->configSize();

	return configWidget->configSize() + sizeof(unsigned char);
}

bool ConfigSelectorWidget::isConfigPointer()
{
	return configWidget->isConfigPointer();
}

std::string ConfigSelectorWidget::getConfigType()
{
	return "";
}
