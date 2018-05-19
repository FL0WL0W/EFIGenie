#include <ConfigDialogWidget.h>

ConfigDialogWidget::ConfigDialogWidget(const char * label, unsigned short serviceId, std::map<int, std::map<unsigned char, std::pair<std::string, std::string>>> definitions)
{
	dialog = new QMdiSubWindow((QWidget *)MainArea);
	
	configSelectorWidget = new ConfigSelectorWidget(serviceId, definitions);

	dialog->layout()->addWidget(configSelectorWidget);
	dialog->layout()->setSizeConstraint(QLayout::SetFixedSize);
	dialog->hide();
	dialog->setWindowTitle(QString(label));

	QGridLayout *layout = new QGridLayout;
	layout->setSpacing(5);
	layout->setMargin(0);

	Label = new QLabel(QString(label));
	Label->setFixedSize(300, 25);
	layout->addWidget(Label, 0, 0);

	QLabel * padding = new QLabel(QString(""));
	padding->setFixedSize(100, 25);
	layout->addWidget(padding, 0, 2);

	Button = new QPushButton();
	Button->setText("Edit");
	Button->setFixedSize(100, 25);
	layout->addWidget(Button, 0, 1);

	connect(Button, SIGNAL(clicked(bool)), this, SLOT(edit()));

	setLayout(layout);
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
	return configSelectorWidget->getConfigValue();
}

void ConfigDialogWidget::setConfigValue(void *val)
{
	configSelectorWidget->setConfigValue(val);
}

unsigned int ConfigDialogWidget::configSize()
{
	return configSelectorWidget->configSize();
}

bool ConfigDialogWidget::isConfigPointer()
{
	return true;
}

std::string ConfigDialogWidget::getConfigType()
{
	return "";
}

void ConfigDialogWidget::edit()
{
	dialog->show();
}