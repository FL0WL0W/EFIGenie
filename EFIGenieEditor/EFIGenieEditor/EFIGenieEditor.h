#pragma once

#include <QtWidgets/QMainWindow>
#include "ui_EFIGenieEditor.h"
#include <QFileDialog>
#include <ConfigWidget.h>

extern QMdiArea *MainArea;

class EFIGenieEditor : public QMainWindow
{
	Q_OBJECT
public slots:
	void triggered(QAction *action);

public:
	ConfigWidget *mainConfigWidget;
	EFIGenieEditor(QWidget *parent = Q_NULLPTR);
	//void showEvent(QShowEvent* event);

private:
	Ui::EFIGenieEditorClass ui;
};
