#include "Table2ConfigWidget.h"

extern QMdiArea *MainArea;

Table2ConfigWidget::~Table2ConfigWidget()
{
	delete config;
	delete Button;
	delete Label;
}

Table2ConfigWidget::Table2ConfigWidget(const char * label, std::string type, bool isConfigPointer, std::string units, double multiplier, double *xMin, double xMinMult, double *xRes, double xResMult, double *xMax, double xMaxMult, double *yMin, double yMinMult, double *yRes, double yResMult, double *yMax, double yMaxMult)
{
	UnitLabel = units;
	IsConfigPointer = isConfigPointer;
	Type = type;
	Multiplier = multiplier;
	XMin = xMin;
	XRes = xRes;
	XMax = xMax;
	YMin = yMin;
	YRes = yRes;
	YMax = yMax;
	XMinMult = xMinMult;
	XResMult = xResMult;
	XMaxMult = xMaxMult;
	YMinMult = yMinMult;
	YResMult = yResMult;
	YMaxMult = yMaxMult;

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

void Table2ConfigWidget::Interpolated()
{
	LastInterpedXMin = *XMin;
	LastInterpedXRes = *XRes;
	LastInterpedXMax = *XMax;
	LastInterpedYMin = *YMin;
	LastInterpedYRes = *YRes;
	LastInterpedYMax = *YMax;
}

void Table2ConfigWidget::Interpolate()
{
	if (LastInterpedXMin == *XMin && LastInterpedXRes == *XRes && LastInterpedXMax == *XMax && LastInterpedYMin == *YMin && LastInterpedYRes == *YRes && LastInterpedYMax == *YMax)
		return;//if we are up to date then we dont need to interp;
			   //TODO: interpolate the values
	delete config;
	config = calloc(configSize(), configSize());
	Interpolated();
}

void * Table2ConfigWidget::getValue()
{
	Interpolate();

	double * value = (double *)calloc(sizeof(double)* (*XRes * XResMult) * (*YRes * YResMult), sizeof(double)* (*XRes * XResMult) * (*YRes * YResMult));
	double * buildVal = value;
	void *buildConfig = config;
	for (int i = 0; i < *XRes * XResMult; i++)
	{
		for (int j = 0; j < *YRes * YResMult; j++)
		{
			CopyTypeToLocationDouble(Type, buildVal, buildConfig);
			*buildVal *= Multiplier;
			buildConfig = (void *)((char*)buildConfig + SizeOfType(Type));
			buildVal++;
		}
	}
	return value;
}

void Table2ConfigWidget::setValue(void *val)
{
	void *buildConfig = config;
	for (int i = 0; i < *XRes * XResMult; i++)
	{
		for (int j = 0; j < *YRes * YResMult; j++)
		{
			double num = *(double *)val / Multiplier;
			CopyDoubleToLocationType(Type, buildConfig, &num);
			val = (void*)((double *)val + 1);
			buildConfig = (void *)((char*)buildConfig + SizeOfType(Type));
		}
	}

	Interpolated(); //setting value so assume we are interpolated
}

void * Table2ConfigWidget::getConfigValue()
{
	Interpolate(); 
	void * val = malloc(configSize());
	memcpy(val, config, configSize());
	return val;
}

void Table2ConfigWidget::setConfigValue(void *val)
{
	memcpy(config, val, configSize());
	Interpolated(); //setting value so assume we are interpolated
}

unsigned int Table2ConfigWidget::configSize()
{
	return SizeOfType(Type) * (*XRes * XResMult) * (*YRes * YResMult);
}

bool Table2ConfigWidget::isConfigPointer()
{
	return IsConfigPointer;
}

std::string Table2ConfigWidget::getConfigType()
{
	return Type;
}

void Table2ConfigWidget::edit()
{
	Interpolate();//Interpolate before we open the dialog
	QMdiSubWindow *dialog = new QMdiSubWindow((QWidget *)MainArea);

	dialog->setWindowTitle(Label->text());

	void * widgetValue = getValue();

	TableEditWidget *editWidget = new TableEditWidget(*XRes * XResMult, *YRes * YResMult, *XMin * XMinMult, *XMax * XMaxMult, getAccuracy(*XMin * XMinMult, *XMax * XMaxMult), *YMin * YMinMult, *YMax * YMaxMult, getAccuracy(*YMin * YMinMult, *YMax * YMaxMult), widgetValue, 0, 100, 0, UnitLabel, false);

	delete widgetValue;
	dialog->layout()->addWidget(editWidget);
	dialog->layout()->setMargin(0);

	if (((QWidget *)MainArea)->height() > editWidget->height())
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