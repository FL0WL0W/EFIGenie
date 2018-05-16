#include "TableEditWidget.h"

TableEditWidget::~TableEditWidget()
{
	delete tableWidget;
}

TableEditWidget::TableEditWidget(int rows, int columns, double rowMin, double rowMax, int rowDecimal, double columnMin, double columnMax, int columnDecimal, void *val, double valueMin, double valueMax, int valueDecimal)
{
	QGridLayout *layout = new QGridLayout;
	QGridLayout *menuBarLayout = new QGridLayout;
	setLayout(layout);

	OkButton = new QPushButton("Ok");
	menuBarLayout->addWidget(OkButton, 0, 0);
	ApplyButton = new QPushButton("Apply");
	menuBarLayout->addWidget(ApplyButton, 0, 1);
	CancelButton = new QPushButton("Cancel");
	menuBarLayout->addWidget(CancelButton, 0, 2);
	layout->addLayout(menuBarLayout, 0, 0);
	connect(OkButton, SIGNAL(clicked(bool)), this, SLOT(ok()));
	connect(ApplyButton, SIGNAL(clicked(bool)), this, SLOT(apply()));
	connect(CancelButton, SIGNAL(clicked(bool)), this, SLOT(cancel()));

	tableWidget = new QTableWidget(rows, columns);
	//tableWidget->horizontalHeader()->setSectionResizeMode(QHeaderView::ResizeToContents);
	layout->addWidget(tableWidget, 1, 0);
	layout->setMargin(0);

	char * rowFormat = (char *)calloc(20, 20);
	sprintf(rowFormat, "%%.%df", rowDecimal);
	QList<QString> rowList = QList<QString>();
	for (int i = 0; i < rows; i++)
	{
		char * buff = (char *)calloc(20, 20);
		sprintf(buff, rowFormat, (((rowMax - rowMin) * i) / (rows - 1) + rowMin));
		rowList.push_back(buff);
		delete buff;
	}
	tableWidget->setVerticalHeaderLabels(QStringList(rowList));
	delete rowFormat;

	char * columnFormat = (char *)calloc(20, 20);
	sprintf(columnFormat, "%%.%df", columnDecimal);
	QList<QString> columnList = QList<QString>();
	for (int i = 0; i < columns; i++)
	{
		char * buff = (char *)calloc(20, 20);
		sprintf(buff, columnFormat, (((columnMax - columnMin) * i) / (columns - 1) + columnMin));
		columnList.push_back(buff);
		delete buff;
	}
	tableWidget->setHorizontalHeaderLabels(QStringList(columnList));
	delete columnFormat;
	tableWidget->setColumnCount(columns);
	tableWidget->setRowCount(rows);

	
	setValue(val);

	// set background
	QPalette pal = palette();
	pal.setColor(QPalette::Base, Qt::lightGray);
	pal.setColor(QPalette::Background, Qt::lightGray);
	pal.setColor(QPalette::Shadow, Qt::lightGray);
	tableWidget->viewport()->setAutoFillBackground(true);
	tableWidget->viewport()->setPalette(pal);
	tableWidget->setAutoFillBackground(true);
	tableWidget->setPalette(pal);
	for (int i = 0; i < tableWidget->rowCount(); i++)
	{
		for (int j = 0; j < tableWidget->columnCount(); j++)
		{
			tableWidget->item(i, j)->setBackgroundColor(Qt::white);
		}
	}

	connect(tableWidget, SIGNAL(cellChanged(int, int)), this, SLOT(setAllSelected(int, int)));

	adjustSize();
}

void TableEditWidget::adjustSize()
{
	tableWidget->resizeRowsToContents();
	tableWidget->resizeColumnsToContents();
	QAbstractItemModel* model = tableWidget->model();
	int rows = model->rowCount();
	int cols = model->columnCount();
	int x = tableWidget->columnViewportPosition(cols - 1) + (tableWidget->columnViewportPosition(cols - 1) - tableWidget->columnViewportPosition(cols - 2)) - 1 + tableWidget->verticalHeader()->width() - tableWidget->frameWidth() - 1 + 50;
	if (x < 250)
		x = 250;
	int y = tableWidget->rowViewportPosition(rows - 1) + (tableWidget->rowViewportPosition(rows - 1) - tableWidget->rowViewportPosition(rows - 2)) + tableWidget->frameWidth() + 95 + tableWidget->viewport()->y();
	QPoint p = tableWidget->viewport()->mapToParent(QPoint(x, y));
	QRect g = geometry();
	g.setSize(QSize(p.x(), p.y()));
	setGeometry(g);
}

void TableEditWidget::setAllSelected(int row, int column)
{
	double val = tableWidget->item(row, column)->data(Qt::DisplayRole).toDouble();
	for (QTableWidgetItem *selected : tableWidget->selectedItems())
	{
		selected->setData(Qt::DisplayRole, val);
	}
}

void * TableEditWidget::getValue()
{
	double * Value = (double *)calloc(sizeof(double)*tableWidget->rowCount()*tableWidget->columnCount(), sizeof(double)*tableWidget->rowCount()*tableWidget->columnCount());
	double * buildVal = Value;
	for (int i = 0; i < tableWidget->rowCount(); i++)
	{
		for (int j = 0; j < tableWidget->columnCount(); j++)
		{
			*buildVal = tableWidget->item(i, j)->data(Qt::DisplayRole).toDouble();
			buildVal++;
		}
	}
	return Value;
}
void TableEditWidget::setValue(void *val)
{
	for (int i = 0; i < tableWidget->rowCount(); i++)
	{
		for (int j = 0; j < tableWidget->columnCount(); j++)
		{
			QTableWidgetItem *item = new QTableWidgetItem(QTableWidgetItem::Type);
			item->setData(Qt::DisplayRole, *(double*)val);
			val = (void*)((double*)val + 1);
			tableWidget->setItem(i, j, item);
		}
	}
}
void TableEditWidget::apply()
{
	void * val = getValue();
	apply(val);
	delete val;
}
void TableEditWidget::ok()
{
	void * val = getValue();
	apply(val);
	delete val;
	quit();
}
void TableEditWidget::cancel()
{
	quit();
}