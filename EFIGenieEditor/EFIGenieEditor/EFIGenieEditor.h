#pragma once

#include <QtWidgets/QMainWindow>
#include "ui_EFIGenieEditor.h"

extern QMdiArea *MainArea;

class EFIGenieEditor : public QMainWindow
{
	Q_OBJECT

public:
	EFIGenieEditor(QWidget *parent = Q_NULLPTR);

private:
	Ui::EFIGenieEditorClass ui;
};
