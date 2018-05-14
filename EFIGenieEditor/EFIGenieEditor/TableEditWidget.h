#include <QWidget>
#include <QLabel>
#include <QObject>
#include <QEvent>
#include <QPushButton>
#include <QGridLayout>
#include <QMouseEvent>
#include <IConfigWidget.h>
#include <Functions.h>
#include <QTableWidget>
#include <QHeaderView>

#ifndef TableEditWidget_H
#define TableEditWidget_H
class TableEditWidget : public QWidget
{
	Q_OBJECT
public slots:
	void setAllSelected(int, int);

public:
	QTableWidget *tableWidget;
	std::string Type;
	
	TableEditWidget(int rows, int columns, double rowMin, double rowMax, int rowDecimal, double columnMin, double columnMax, int columnDecimal, void *val, double valueMin, double valueMax, int valueDecimal);
	void * getValue();
	void setValue(void *val);
	void adjustSize();
};
#endif