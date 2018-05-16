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
signals:
	void apply(void *val);
	void quit();
public slots:
	void setAllSelected(int, int);
	void apply();
	void ok();
	void cancel();
public:
	QTableWidget *tableWidget;
	QPushButton *OkButton;
	QPushButton *ApplyButton;
	QPushButton *CancelButton;
	std::string Type;
	
	~TableEditWidget();
	TableEditWidget(int rows, int columns, double rowMin, double rowMax, int rowDecimal, double columnMin, double columnMax, int columnDecimal, void *val, double valueMin, double valueMax, int valueDecimal);
	void * getValue();
	void setValue(void *val);
	void adjustSize();
};
#endif