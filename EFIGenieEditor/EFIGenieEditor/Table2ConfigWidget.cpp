#include "Table2ConfigWidget.h"

extern QMdiArea *MainArea;

Table2ConfigWidget::~Table2ConfigWidget()
{
	delete config;
	delete Button;
	delete Label;
}

Table2ConfigWidget::Table2ConfigWidget(const char * label, std::string type, double multiplier, double *xMin, double *xRes, double *xMax, double *yMin, double *yRes, double *yMax)
{
	Type = type;
	Multiplier = multiplier;
	XMin = xMin;
	XRes = xRes;
	XMax = xMax;
	YMin = yMin;
	YRes = yRes;
	YMax = yMax;

	config = calloc(configSize(), configSize());

	Interpolated();

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

	double * value = (double *)calloc(sizeof(double)* (*XRes) * (*YRes), sizeof(double)* (*XRes) * (*YRes));
	double * buildVal = value;
	void *buildConfig = config;
	for (int i = 0; i < *XRes; i++)
	{
		for (int j = 0; j < *YRes; j++)
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
	for (int i = 0; i < *XRes; i++)
	{
		for (int j = 0; j < *YRes; j++)
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
	return &config;
}

void Table2ConfigWidget::setConfigValue(void *val)
{
	memcpy(config, val, configSize());
	Interpolated(); //setting value so assume we are interpolated
}

unsigned int Table2ConfigWidget::configSize()
{
	return SizeOfType(Type) * (*XRes) * (*YRes);
}

bool Table2ConfigWidget::isConfigPointer()
{
	return true;
}

std::string Table2ConfigWidget::getConfigType()
{
	return Type;
}

void Table2ConfigWidget::edit()
{
	Interpolate();//Interpolate before we open the dialog
	QMdiSubWindow *dialog = new QMdiSubWindow((QWidget *)MainArea);

	void * widgetValue = getValue();

	TableEditWidget *editWidget = new TableEditWidget(*XRes, *YRes, *XMin, *XMax, getAccuracy(*XMin, *XMax), *YMin, *YMax, getAccuracy(*YMin, *YMax), widgetValue, 0, 100, 0);

	delete widgetValue;
	dialog->layout()->addWidget(editWidget);
	dialog->layout()->setMargin(0);

	dialog->resize(editWidget->width(), editWidget->height());
	dialog->setWindowFlags(Qt::CustomizeWindowHint);
	dialog->show();

	((QWidget *)parent())->setDisabled(true);

	QEventLoop loop;
	connect(editWidget, SIGNAL(quit()), &loop, SLOT(quit()));
	connect(editWidget, SIGNAL(apply(void *)), this, SLOT(setValue(void *)));
	loop.exec();
	delete editWidget; 
	delete dialog;
	((QWidget *)parent())->setDisabled(false);
}