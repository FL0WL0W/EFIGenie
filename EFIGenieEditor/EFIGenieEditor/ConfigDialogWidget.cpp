#include <ConfigDialogWidget.h>

extern QMdiArea *MainArea;

ConfigDialogWidget::ConfigDialogWidget(const char * label, int serviceId, bool isConfigPointer, bool isStatic, bool enableDisable, std::map<int, std::map<unsigned char, std::pair<std::string, std::string>>> definitions)
{
	ServiceId = serviceId;
	EnableDisable = enableDisable;
	IsConfigPointer = isConfigPointer;

	dialog = new QMdiSubWindow((QWidget *)MainArea);
	
	configSelectorWidget = new ConfigSelectorWidget(serviceId, isConfigPointer, isStatic, definitions, 700);

	dialog->layout()->addWidget(configSelectorWidget);
	dialog->layout()->setSizeConstraint(QLayout::SetFixedSize);
	dialog->hide();
	dialog->setWindowTitle(QString(label));

	QGridLayout *layout = new QGridLayout;
	layout->setSpacing(5);
	layout->setMargin(0);

	Label = new QLabel(QString(label));
	Label->setFixedSize(275, 25);
	layout->addWidget(Label, 0, 0);
	
	if (enableDisable)
	{
		QLabel * padding = new QLabel(QString("Enabled"));
		padding->setFixedSize(75, 25);
		layout->addWidget(padding, 0, 3);
	}
	else
	{
		QLabel * padding = new QLabel(QString(""));
		padding->setFixedSize(100, 25);
		layout->addWidget(padding, 0, 2);
	}

	Button = new QPushButton();
	Button->setText("Edit");
	Button->setFixedSize(100, 25);
	layout->addWidget(Button, 0, 1);

	if (enableDisable)
	{
		CheckBox = new QCheckBox();
		CheckBox->setFixedSize(25, 25);
		CheckBox->setChecked(false);
		Button->setDisabled(true);
		layout->addWidget(CheckBox, 0, 2);
		connect(CheckBox, SIGNAL(stateChanged(int)), this, SLOT(checkedStateChanged(int)));
	}

	connect(Button, SIGNAL(clicked(bool)), this, SLOT(edit()));

	setLayout(layout);
}

void ConfigDialogWidget::checkedStateChanged(int checkState)
{
	if (checkState == Qt::Unchecked) 
	{
		Button->setDisabled(true);
	}
	else 
	{
		Button->setDisabled(false);
	}
}

void * ConfigDialogWidget::getValue()
{
	throw;
}

void ConfigDialogWidget::setValue(void *)
{
	throw;
}

void * ConfigDialogWidget::getConfigValue()
{
	if (EnableDisable)
	{
		if (CheckBox->isChecked())
		{
			void * val = malloc(configSize());
			*((unsigned short*)val) = ServiceId;

			void * configValue = configSelectorWidget->getConfigValue();

			memcpy(((unsigned short*)val + 1), configValue, configSize());

			return val;
		}
		else
			return 0;
	}
	else
		return configSelectorWidget->getConfigValue();
}

void ConfigDialogWidget::setConfigValue(void *val)
{
	if (EnableDisable)
	{
		if (*((unsigned short*)val) == ServiceId)
		{
			CheckBox->setChecked(true);
			configSelectorWidget->setConfigValue(((unsigned short*)val + 1));
		}
		else
			CheckBox->setChecked(false);
	}
	else
		configSelectorWidget->setConfigValue(val);
}

unsigned int ConfigDialogWidget::configSize()
{
	if (EnableDisable)
	{
		if (CheckBox->isChecked())
		{
			return configSelectorWidget->configSize() + sizeof(unsigned short);
		}
		else
			return 0;
	}
	else
		return configSelectorWidget->configSize();
}

bool ConfigDialogWidget::isConfigPointer()
{
	return configSelectorWidget->isConfigPointer();
}

std::string ConfigDialogWidget::getConfigType()
{
	return "";
}

void ConfigDialogWidget::edit()
{
	dialog->show();
}