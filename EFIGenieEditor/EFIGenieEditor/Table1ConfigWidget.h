#include <QWidget>
#include <QLabel>
#include <QPushButton>
#include <QGridLayout>
#include <QMouseEvent>
#include <IConfigWidget.h>
#include <Functions.h>

#ifndef Table1ConfigWidget_H
#define Table1ConfigWidget_H
class Table1ConfigWidget : public QWidget, public IConfigWidget
{
public:
	QLabel * Label;
	QPushButton * Button;
	int Decimals;
	std::string Type;
	double *XMin;
	double *XRes;
	double *XMax;

	double LastInterpedXMin;
	double LastInterpedXRes;
	double LastInterpedXMax;

	void *config;

	Table1ConfigWidget(const char * label, std::string type, double *xMin, double *xRes, double *xMax)
	{
		Type = type;
		XMin = xMin;
		XRes = xRes;
		XMax = xMax;

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
		Button->installEventFilter(this);

		setLayout(layout);
	}

	void Interpolated()
	{
		LastInterpedXMin = *XMin;
		LastInterpedXRes = *XRes;
		LastInterpedXMax = *XMax;
	}

	void Interpolate()
	{
		if (LastInterpedXMin == *XMin && LastInterpedXRes == *XRes && LastInterpedXMax == *XMax)
			return;//if we are up to date then we dont need to interp;
		//TOD: interpolate the values
		Interpolated();
	}

	void * getValue()
	{
		throw;
	}

	void setValue(void *val)
	{
		throw;
	}

	void * getConfigValue()
	{
		Interpolate();
		return &config;
	}

	void setConfigValue(void *val)
	{
		memcpy(config, val, configSize());
		Interpolated(); //setting value so assume we are interpolated
	}

	unsigned int configSize()
	{
		return SizeOfType(Type) * (*XRes);
	}

	bool isConfigPointer()
	{
		return true;
	}

	std::string getConfigType()
	{
		return Type;
	}

	bool eventFilter(QObject *watched, QEvent *e)
	{
		if (e->type() == QEvent::MouseButtonRelease)
		{
			QMouseEvent* ev = (QMouseEvent*)e;
			if (ev->button() == Qt::LeftButton) {
				if (watched == Button)
				{
					Interpolate();//Interpolate before we open the dialog
					//TODO: add table dialog
				}
			}
		}
		return false;
	}
};
#endif