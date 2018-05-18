#include <ConfigSelectorWidget.h>

ConfigSelectorWidget::ConfigSelectorWidget(unsigned short serviceId, std::map<unsigned short, std::map<unsigned char, std::pair<std::string, std::string>>> definitions)
{
	Definitions = definitions;
	std::map<unsigned short, std::map<unsigned char, std::pair<std::string, std::string>>>::iterator typeIt = Definitions.find(serviceId);
	TypeDefinitions = typeIt->second;

	Selection = new QComboBox();
	
	for (std::map<unsigned char, std::pair<std::string, std::string>>::iterator it = TypeDefinitions.begin(); it != TypeDefinitions.end(); ++it)
	{
		Selection->addItem(QString(it->second.first.c_str()), QVariant((int)it->first));
	}

	setServiceId(TypeDefinitions.begin()->first);

	layout->addWidget(Selection, 0, 0);

	setLayout(layout);

	connect(Selection, SIGNAL(currentIndexChanged(int)), this, SLOT(currentIndexChanged(int)));
}

void ConfigSelectorWidget::currentIndexChanged(int index)
{
	setServiceId(Selection->itemData(index).toInt());
}

void ConfigSelectorWidget::setServiceId(unsigned char serviceId)
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
	configWidget = new ConfigWidget(definition, Definitions);

	layout->addWidget(configWidget, 1, 0);
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
	unsigned short serviceId = *((unsigned char *)val);

	for (int i = 0; i < Selection->count(); i++)
	{
		if (Selection->itemData(i).toInt() == serviceId)
		{
			setServiceId(serviceId);
			break;
		}
	}

	configWidget->setConfigValue((void *)((unsigned char *)val + 1));
}

unsigned int ConfigSelectorWidget::configSize()
{
	return configWidget->configSize() + sizeof(unsigned char);
}

bool ConfigSelectorWidget::isConfigPointer()
{
	return true;
}

std::string ConfigSelectorWidget::getConfigType()
{
	return "";
}
