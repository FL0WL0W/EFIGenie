#include <QWidget>
#include <QLabel>
#include <QEventLoop>
#include <QPushButton>
#include <QGridLayout>
#include <QMouseEvent>
#include <QMdiSubWindow>
#include <IConfigWidget.h>
#include <Functions.h>
#include "TableEditWidget.h"
#include "math.h"
#include "TableEditWidget.h"

#ifndef Table2ConfigWidget_H
#define Table2ConfigWidget_H

class Table2ConfigWidget : public QWidget, public IConfigWidget
{
	Q_OBJECT
public slots:
	void setValue(void *val);
	void edit();
public:
	QLabel * Label;
	QPushButton * Button;
	int Decimals;
	std::string Type;
	double Multiplier;
	double *XMin;
	double *XRes;
	double *XMax;
	double *YMin;
	double *YRes;
	double *YMax;

	double LastInterpedXMin;
	double LastInterpedXRes;
	double LastInterpedXMax;
	double LastInterpedYMin;
	double LastInterpedYRes;
	double LastInterpedYMax;

	void *config;

	~Table2ConfigWidget();
	Table2ConfigWidget(const char * label, std::string type, double multiplier, double *xMin, double *xRes, double *xMax, double *yMin, double *yRes, double *yMax);

	void Interpolated();

	void Interpolate();

	void * getValue();


	void * getConfigValue();

	void setConfigValue(void *val);

	unsigned int configSize();

	bool isConfigPointer();

	std::string getConfigType();
};
#endif