#pragma once

#include <QtWidgets/QMainWindow>
#include "ui_EFIGenieEditor.h"

class EFIGenieEditor : public QMainWindow
{
	Q_OBJECT

public:
	EFIGenieEditor(QWidget *parent = Q_NULLPTR);

private:
	Ui::EFIGenieEditorClass ui;
};
