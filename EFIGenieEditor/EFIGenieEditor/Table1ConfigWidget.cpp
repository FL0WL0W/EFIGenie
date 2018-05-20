#include "Table1ConfigWidget.h"

extern QMdiArea *MainArea;

Table1ConfigWidget::~Table1ConfigWidget()
{
	delete config;
	delete Button;
	delete Label;
}

Table1ConfigWidget::Table1ConfigWidget(const char * label, std::string type, bool isConfigPointer, std::string units, double *xMin, double xMinMult, double *xRes, double xResMult, double *xMax, double xMaxMult, double multiplier)
{
	UnitLabel = units;
	IsConfigPointer = isConfigPointer;
	Multiplier = multiplier;
	Type = type;
	XMin = xMin;
	XRes = xRes;
	XMax = xMax;
	XMinMult = xMinMult;
	XResMult = xResMult;
	XMaxMult = xMaxMult;

	config = calloc(configSize(), configSize());

	Interpolated();

	QGridLayout *layout = new QGridLayout;
	layout->setSpacing(5);
	layout->setMargin(0);

	Label = new QLabel(QString(label));
	Label->setFixedSize(300, 25);
	layout->addWidget(Label, 0, 0);

	QLabel * unitLabel = new QLabel(QString(units.c_str()));
	unitLabel->setFixedSize(100, 25);
	layout->addWidget(unitLabel, 0, 2);

	Button = new QPushButton();
	Button->setText("Edit");
	Button->setFixedSize(100, 25);
	layout->addWidget(Button, 0, 1);

	connect(Button, SIGNAL(clicked(bool)), this, SLOT(edit()));

	setLayout(layout);
}

void Table1ConfigWidget::Interpolated()
{
	LastInterpedXMin = *XMin;
	LastInterpedXRes = *XRes;
	LastInterpedXMax = *XMax;
}

void Table1ConfigWidget::Interpolate()
{
	if (LastInterpedXMin == *XMin && LastInterpedXRes == *XRes && LastInterpedXMax == *XMax)
		return;//if we are up to date then we dont need to interp;
			   //TODO: interpolate the values
	delete config;
	config = calloc(configSize(), configSize());
	Interpolated();
}

void * Table1ConfigWidget::getValue()
{
	Interpolate();

	double * value = (double *)calloc(sizeof(double)* (*XRes * XResMult), sizeof(double)* (*XRes * XResMult));
	double * buildVal = value;
	void *buildConfig = config;
	for (int i = 0; i < *XRes * XResMult; i++)
	{
		CopyTypeToLocationDouble(Type, buildVal, buildConfig);
		*buildVal *= Multiplier;
		buildConfig = (void *)((char*)buildConfig + SizeOfType(Type));
		buildVal++;
	}
	return value;
}

void Table1ConfigWidget::setValue(void *val)
{
	void *buildConfig = config;
	for (int i = 0; i < *XRes * XResMult; i++)
	{
		double num = *(double *)val / Multiplier;
		CopyDoubleToLocationType(Type, buildConfig, &num);
		val = (void*)((double *)val + 1);
		buildConfig = (void *)((char*)buildConfig + SizeOfType(Type));
	}

	Interpolated(); //setting value so assume we are interpolated
}

void * Table1ConfigWidget::getConfigValue()
{
	Interpolate();
	void * val = malloc(configSize());
	memcpy(val, config, configSize());
	return val;
}

void Table1ConfigWidget::setConfigValue(void *val)
{
	memcpy(config, val, configSize());
	Interpolated(); //setting value so assume we are interpolated
}

unsigned int Table1ConfigWidget::configSize()
{
	return SizeOfType(Type) * (*XRes * XResMult);
}

bool Table1ConfigWidget::isConfigPointer()
{
	return IsConfigPointer;
}

std::string Table1ConfigWidget::getConfigType()
{
	return Type;
}

void Table1ConfigWidget::edit()
{
	Interpolate();//Interpolate before we open the dialog
	QMdiSubWindow *dialog = new QMdiSubWindow((QWidget *)MainArea);

	dialog->setWindowTitle(Label->text());

	void * widgetValue = getValue();

	TableEditWidget *editWidget = new TableEditWidget(*XRes * XResMult, 1, *XMin * XMinMult, *XMax * XMaxMult, getAccuracy(*XMin * XMinMult, *XMax * XMaxMult), 0, 0, 0, widgetValue, 0, 100, 0, UnitLabel, true);

	delete widgetValue;
	dialog->layout()->addWidget(editWidget);
	dialog->layout()->setMargin(0);

	if(((QWidget *)MainArea)->height() > editWidget->height())
		dialog->resize(editWidget->width(), editWidget->height());
	else
		dialog->resize(editWidget->width(), ((QWidget *)MainArea)->height());

	dialog->setWindowFlags(Qt::CustomizeWindowHint);
	dialog->show();

	((QWidget *)parent())->setDisabled(true);
	((QWidget *)parent()->parent())->setDisabled(true);

	QEventLoop loop;
	connect(editWidget, SIGNAL(quit()), &loop, SLOT(quit()));
	connect(editWidget, SIGNAL(apply(void *)), this, SLOT(setValue(void *)));
	loop.exec();
	delete editWidget;
	delete dialog;
	((QWidget *)parent())->setDisabled(false);
	((QWidget *)parent()->parent())->setDisabled(false);
}