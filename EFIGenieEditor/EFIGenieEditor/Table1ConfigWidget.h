#include <QWidget>
#include <QLabel>
#include <QEventLoop>
#include <QPushButton>
#include <QGridLayout>
#include <QMouseEvent>
#include <IConfigWidget.h>
#include <QMdiSubWindow>
#include <Functions.h>
#include "TableEditWidget.h"
#include <QDialog>

#ifndef Table1ConfigWidget_H
#define Table1ConfigWidget_H
class Table1ConfigWidget : public QWidget, public IConfigWidget
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
	double XMinMult;
	double XResMult;
	double XMaxMult;
	bool IsConfigPointer;

	double LastInterpedXMin;
	double LastInterpedXRes;
	double LastInterpedXMax;

	void *config;

	std::string UnitLabel;

	~Table1ConfigWidget();
	Table1ConfigWidget(const char * label, std::string type, bool isConfigPointer, std::string units, double *xMin, double xMinMult, double *xRes, double xResMult, double *xMax, double xMaxMult, double multiplier);

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